module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json([
    { id: 1, content: 'API日记1' },
    { id: 2, content: 'API日记2' }
  ]);
};