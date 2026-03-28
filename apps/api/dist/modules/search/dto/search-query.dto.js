"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchQueryDto = exports.SearchSort = void 0;
const legacy_prisma_enums_1 = require("../../../common/legacy-prisma-enums");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
var SearchSort;
(function (SearchSort) {
    SearchSort["LATEST"] = "latest";
    SearchSort["PRICE_ASC"] = "price_asc";
    SearchSort["PRICE_DESC"] = "price_desc";
})(SearchSort || (exports.SearchSort = SearchSort = {}));
class SearchQueryDto {
    q;
    category;
    condition;
    sort = SearchSort.LATEST;
}
exports.SearchQueryDto = SearchQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => String(value).trim()),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(160),
    __metadata("design:type", String)
], SearchQueryDto.prototype, "q", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => String(value).trim()),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], SearchQueryDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(legacy_prisma_enums_1.ListingCondition),
    __metadata("design:type", String)
], SearchQueryDto.prototype, "condition", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(SearchSort),
    __metadata("design:type", String)
], SearchQueryDto.prototype, "sort", void 0);
