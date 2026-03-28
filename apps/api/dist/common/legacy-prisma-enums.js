"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderStatus = exports.PaymentMethod = exports.VerificationRequestStatus = exports.ListingStatus = exports.ListingCondition = exports.SellerType = exports.VerificationStatus = exports.AccountType = void 0;
var AccountType;
(function (AccountType) {
    AccountType["PERSONAL"] = "PERSONAL";
    AccountType["STORE"] = "STORE";
})(AccountType || (exports.AccountType = AccountType = {}));
var VerificationStatus;
(function (VerificationStatus) {
    VerificationStatus["UNVERIFIED"] = "UNVERIFIED";
    VerificationStatus["PENDING"] = "PENDING";
    VerificationStatus["VERIFIED"] = "VERIFIED";
})(VerificationStatus || (exports.VerificationStatus = VerificationStatus = {}));
var SellerType;
(function (SellerType) {
    SellerType["PERSONAL"] = "PERSONAL";
    SellerType["STORE"] = "STORE";
})(SellerType || (exports.SellerType = SellerType = {}));
var ListingCondition;
(function (ListingCondition) {
    ListingCondition["NEW"] = "NEW";
    ListingCondition["LIKE_NEW"] = "LIKE_NEW";
    ListingCondition["GOOD"] = "GOOD";
    ListingCondition["FAIR"] = "FAIR";
    ListingCondition["POOR"] = "POOR";
})(ListingCondition || (exports.ListingCondition = ListingCondition = {}));
var ListingStatus;
(function (ListingStatus) {
    ListingStatus["DRAFT"] = "DRAFT";
    ListingStatus["PUBLISHED"] = "PUBLISHED";
    ListingStatus["SOLD"] = "SOLD";
    ListingStatus["ARCHIVED"] = "ARCHIVED";
})(ListingStatus || (exports.ListingStatus = ListingStatus = {}));
var VerificationRequestStatus;
(function (VerificationRequestStatus) {
    VerificationRequestStatus["PENDING"] = "PENDING";
    VerificationRequestStatus["VERIFIED"] = "VERIFIED";
    VerificationRequestStatus["EXPIRED"] = "EXPIRED";
    VerificationRequestStatus["CANCELLED"] = "CANCELLED";
})(VerificationRequestStatus || (exports.VerificationRequestStatus = VerificationRequestStatus = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH_ON_DELIVERY"] = "CASH_ON_DELIVERY";
    PaymentMethod["ONLINE_PAYMENT"] = "ONLINE_PAYMENT";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "PENDING";
    OrderStatus["CONFIRMED"] = "CONFIRMED";
    OrderStatus["PAID"] = "PAID";
    OrderStatus["PROCESSING"] = "PROCESSING";
    OrderStatus["SHIPPED"] = "SHIPPED";
    OrderStatus["DELIVERED"] = "DELIVERED";
    OrderStatus["CANCELLED"] = "CANCELLED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
