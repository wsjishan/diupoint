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
exports.ListListingsQueryDto = exports.ListingSort = void 0;
const legacy_prisma_enums_1 = require("../../../common/legacy-prisma-enums");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
var ListingSort;
(function (ListingSort) {
    ListingSort["LATEST"] = "latest";
    ListingSort["PRICE_ASC"] = "price_asc";
    ListingSort["PRICE_DESC"] = "price_desc";
})(ListingSort || (exports.ListingSort = ListingSort = {}));
class ListListingsQueryDto {
    q;
    category;
    condition;
    sort = ListingSort.LATEST;
    page = 1;
    limit = 20;
}
exports.ListListingsQueryDto = ListListingsQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => String(value).trim()),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(160),
    __metadata("design:type", String)
], ListListingsQueryDto.prototype, "q", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => String(value).trim()),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], ListListingsQueryDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(legacy_prisma_enums_1.ListingCondition),
    __metadata("design:type", String)
], ListListingsQueryDto.prototype, "condition", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ListingSort),
    __metadata("design:type", String)
], ListListingsQueryDto.prototype, "sort", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ListListingsQueryDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ListListingsQueryDto.prototype, "limit", void 0);
