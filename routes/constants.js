/**
 * NOTES using dayjs library:
 * - `dayjs('2018-12-31').format('DD/MM/YYYY')` // console: "31/12/2018"
 * - `dayjs('31-12-2018').format('DD/MM/YYYY')` // console: "NaN/NaN/NaN"
 */
const dateFormat = 'DD/MM/YYYY';
const postgresDateFormat = 'YYYY/MM/DD'

module.exports = { dateFormat, postgresDateFormat };
