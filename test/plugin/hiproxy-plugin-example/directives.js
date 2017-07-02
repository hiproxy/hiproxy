module.exports = [
  {
    name: 'add',
    scope: ['global', 'domain', 'location'],
    fn: function (key, a, b) {
      var value = Number(a) + Number(b);
      this.props[key] = value;
    }
  }
];
