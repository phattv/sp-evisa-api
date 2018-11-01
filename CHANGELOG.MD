## [2.2.2] - 2018-11-02
- Add thanhhang@evisa-vn.com to bcc for mailer.js

## [2.2.1] - 2018-08-10
- Don't read camelCase variables
- POST /order: use null data instead of empty string for date

## [2.2.0] - 2018-06-25
- Update success-order email template with logo attachment

## [v2.1.1] - 2018-06-25
- Add GET /orders/stats
- Add GET /orders filter by processing_time
- Fix GET /orders filter by created_at

## [v2.1.0] - 2018-06-05
- Enhance docker build speed
- Send confirmation email on POST /order

## [v2.0.1] - 2018-05-23
- Add knex debug mode for non-production environment(s)
- Add count & filters for /orders

## [v2.0.0] - 2018-05-21
- Add search sort pagination

## [v1.9.1] - 2018-05-17
Add query functionality for `GET /orders`

## [v1.9.0] - 2018-05-17
Add `PUT /orders/:id`

## [v1.8] - 2018-05-16
Add `GET /orders`, `GET /orders/:id`, `POST /order`