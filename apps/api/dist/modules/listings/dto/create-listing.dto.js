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
exports.CreateListingDto = void 0;
const legacy_prisma_enums_1 = require("../../../common/legacy-prisma-enums");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class CreateListingDto {
    sellerType;
    storeProfileId;
    title;
    description;
    category;
    condition;
    price;
    location;
    status;
}
exports.CreateListingDto = CreateListingDto;
__decorate([
    (0, class_validator_1.IsEnum)(legacy_prisma_enums_1.SellerType),
    __metadata("design:type", String)
], CreateListingDto.prototype, "sellerType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(64),
    __metadata("design:type", String)
], CreateListingDto.prototype, "storeProfileId", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => String(value).trim()),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(160),
    __metadata("design:type", String)
], CreateListingDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateListingDto.prototype, "description", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => String(value).trim()),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], CreateListingDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(legacy_prisma_enums_1.ListingCondition),
    __metadata("design:type", String)
], CreateListingDto.prototype, "condition", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => Number(value)),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateListingDto.prototype, "price", void 0);
__decorate([
    (0, class_transformer_1.Transform)(({ value }) => String(value).trim()),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(160),
    __metadata("design:type", String)
], CreateListingDto.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(legacy_prisma_enums_1.ListingStatus),
    __metadata("design:type", String)
], CreateListingDto.prototype, "status", void 0);
