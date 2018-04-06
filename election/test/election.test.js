var Election = artifacts.require('./Election.sol');

contract('Election', function () {
  it('initializes with two candidates', () => {
    return Election.deployed()
      .then((instance) => instance.candidatesCount())
      .then((count) => assert.equal(count, 2))
      .catch((err) => console.error(err));
  });

  it('initializes the candidates with the correct values', () => {
    let electionInstance;
    return Election.deployed()
      .then((instance) => electionInstance = instance)
      .then(() => electionInstance.candidates(1))
      .then((candidate) => {
        assert.equal(candidate[0], 1, 'contains the correct id');
        assert.equal(candidate[1], 'Candidate 1', 'contains the correct name');
        assert.equal(candidate[2], 0, 'contains the correct vote count');
      })
      .then(() => electionInstance.candidates(2))
      .then((candidate) => {
        assert.equal(candidate[0], 2, 'contains the correct id');
        assert.equal(candidate[1], 'Candidate 2', 'contains the correct name');
        assert.equal(candidate[2], 0, 'contains the correct vote count');
      })
      .catch((err) => console.error(err));
  });
});
