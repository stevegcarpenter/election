App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // TODO: refactor conditional
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Election.json', function(election) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Election = TruffleContract(election);
      // Connect provider to interact with contract
      App.contracts.Election.setProvider(App.web3Provider);

      return App.render();
    });
  },

  render: function () {
    let election;
    let loader = $('#loader');
    let content = $('#content');

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase((err, account) => {
      if (err === null) {
        App.account = account;
        $('#accountAddress').html('Your Account: ' + account);
      }
    });

    // Load contract data
    App.contracts.Election.deployed()
      .then(e => election = e)
      .then(() => election.candidatesCount())
      .then(candidatesCount => {
        var candidatesResults = $('#candidatesResults');
        candidatesResults.empty();

        let candidatesSelect = $('#candidatesSelect');
        candidatesSelect.empty();

        // render all candidate data
        for (var i = 1; i <= candidatesCount; i++) {
          election.candidates(i)
            .then(candidate => {
              candidatesResults.append(
                `<tr>
                  <!-- candidate Id -->
                  <th>${candidate[0]}</th>
                  <!-- candidate name -->
                  <td>${candidate[1]}</td>
                  <!-- candidate vote count -->
                  <td>${candidate[2]}</td>
                </tr>`
              );

              // Render candidate ballot option
              candidatesSelect.append(`<option value='${candidate[0]}'>${candidate[1]}</ option>`);
            })
            .catch(console.warn);
        }
      })
      .then(() => election.voters(App.account))
      .then(alreadyVoted => alreadyVoted ? $('form').hide() : null)
      .then(() => loader.hide())
      .then(() => content.show())
      .catch(console.warn);
  },

  castVote: function () {
    let candidateId = $('#candidatesSelect').val();
    App.contracts.Election.deployed()
      .then(election => election.vote(candidateId, { from: App.account }))
      .then(() => $('#content').hide())
      .then(() => $('#loader').show())
      .catch(console.error);
  },
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
