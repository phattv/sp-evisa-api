/**
 * NOTES using dayjs library:
 * - `dayjs('2018-12-31').format('DD/MM/YYYY')` // console: "31/12/2018"
 * - `dayjs('31-12-2018').format('DD/MM/YYYY')` // console: "NaN/NaN/NaN"
 */
const dateFormat = 'DD/MM/YYYY';
const postgresDateFormat = 'YYYY/MM/DD';

// Options
const typeOptions = {
  one_month_single: '1 month single',
  one_month_multiple: '1 month multiple',
  three_month_single: '3 months single',
  three_month_multiple: '3 months multiple',
  six_month_multiple: '6 months multiple',
  one_year_multiple: '1 year multiple',
};
const processingTimeOptions = {
  normal: 'normal (guaranteed 2 working days)',
  urgent: 'urgent (guaranteed 4-8 working hours)',
  emergency: 'emergency (guaranteed 1 working hour)',
};

module.exports = {
  dateFormat,
  postgresDateFormat,
  typeOptions,
  processingTimeOptions,
};
