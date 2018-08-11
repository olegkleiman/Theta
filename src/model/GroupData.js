// @flow
// type GroupData = {
//   name: String,
//   symbol: Number,
//   openFrom: Date,
//   openTill: Date,
//   price: Number
// }

export default
class GroupData {
  name: String;
  symbol: String;
  capacity: Number;

  constructor(name: String,
              symbol: String,
              capacity: Number,
              openFrom: Timestamp,
              openTill: Timestamp) {
    this.name = name;
    this.symbol = symbol;
    this.capacity = capacity;
    if( openFrom )
      this.openFrom = moment.unix(openFrom.seconds);
    if( openTill )
      this.openTill = moment.unix(openTill.seconds);
  }
}
