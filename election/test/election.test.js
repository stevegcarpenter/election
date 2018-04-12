var Election = artifacts.require('./Election.sol');

contract('Election', (accounts) => {
  it('initializes with two candidates', () => {
    return Election.deployed()
      .then(instance => instance.candidatesCount())
      .then(count => assert.equal(count, 2))
      .catch(err => console.error(err));
  });

  it('initializes the candidates with the correct values', () => {
    let election;
    return Election.deployed()
      .then(instance => election = instance)
      .then(() => election.candidates(1))
      .then(candidate => {
        assert.equal(candidate[0], 1, 'contains the correct id');
        assert.equal(candidate[1], 'Candidate 1', 'contains the correct name');
        assert.equal(candidate[2], 0, 'contains the correct vote count');
      })
      .then(() => election.candidates(2))
      .then((candidate) => {
        assert.equal(candidate[0], 2, 'contains the correct id');
        assert.equal(candidate[1], 'Candidate 2', 'contains the correct name');
        assert.equal(candidate[2], 0, 'contains the correct vote count');
      })
      .catch((err) => console.error(err));
  });

  it('allows a voter to cast a vote', () => {
    let election;
    return Election.deployed()
      .then(instance => election = instance)
      .then(() => election.vote(1 /* candidate 1 */, { from: accounts[0] }))
      .then((/* receipt */) => election.voters(accounts[0]))
      .then(voted => assert(voted, 'the voter was marked as voted'))
      .then(() => election.candidates(1 /* candidate 1 */))
      .then(candidate => assert.equal(candidate[2] /* vote tallies */, 1,
        `increments the candidate's vote count`));
  });

  it('throws an exception for invalid candidates', () => {
    let election;
    return Election.deployed()
      .then(instance => election = instance)
      .then(() => election.vote(1000, { from: accounts[1] }))
      .then(assert.fail)
      .catch(err => assert(err.message.includes('revert'), 'error message must contain revert'))
      .then(() => election.candidates(1))
      .then(candidate1 => assert.equal(candidate1[2] /* vote tallies */, 1, 'candidate 1 did not receive any additional votes'))
      .then(() => election.candidates(2))
      .then(candidate2 => assert.equal(candidate2[2] /* vote tallies */, 0, 'candidate 2 did not receive any votes'));
  });

  it('throws an exception for double voting', () => {
    let election;
    return Election.deployed()
      .then(instance => election = instance)
      .then(() => election.vote(2 /* candidate 2 */, { from: accounts[1] }))
      .then(() => election.candidates(2 /* candidate 2 */))
      .then(c2 => assert.equal(c2[2] /* vote tallies */, 1, 'initial vote successful'))
      .then(() => election.vote(2 /* candidate 2 */, { from: accounts[1] }))
      .then(assert.fail)
      .catch(err => err.message.includes('revert'))
      .then(() => election.candidates(1))
      .then(candidate1 => assert.equal(candidate1[2] /* vote tallies */, 1, 'candidate 1 did not receive any additional votes'))
      .then(() => election.candidates(2))
      .then(candidate2 => assert.equal(candidate2[2] /* vote tallies */, 1, 'candidate 2 did not receive any additional votes'));
  });
});
