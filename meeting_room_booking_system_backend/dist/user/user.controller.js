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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("./user.service");
const registerUser_dto_1 = require("./dto/registerUser.dto");
const loginUser_dto_1 = require("./dto/loginUser.dto");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const custom_decorator_1 = require("../custom.decorator");
const user_info_vo_1 = require("./vo/user-info.vo");
const update_user_password_dto_1 = require("./dto/update-user-password.dto");
const redis_service_1 = require("../redis-server/redis.service");
const email_service_1 = require("../email/email.service");
const update_user_dto_1 = require("./dto/update-user.dto");
const parseInt_1 = require("../utils/parseInt");
let UserController = class UserController {
    constructor(userService) {
        this.userService = userService;
    }
    async initData() {
        await this.userService.initData();
        return 'done';
    }
    async register(registerUser) {
        return await this.userService.register(registerUser);
    }
    async userLogin(loginUser) {
        const vo = await this.userService.login(loginUser, false);
        vo.accessToken = this.jwtService.sign({
            userId: vo.userInfo.id,
            username: vo.userInfo.username,
            roles: vo.userInfo.roles,
            permissions: vo.userInfo.permissions,
        }, {
            expiresIn: this.configService.get('jwt_access_token_expires_time') || '30m',
        });
        vo.refreshToken = this.jwtService.sign({
            userId: vo.userInfo.id,
        }, {
            expiresIn: this.configService.get('jwt_refresh_token_express_time') || '7d',
        });
        return vo;
    }
    async adminLogin(loginUser) {
        const vo = await this.userService.login(loginUser, true);
        vo.accessToken = this.jwtService.sign({
            userId: vo.userInfo.id,
            username: vo.userInfo.username,
            roles: vo.userInfo.roles,
            permissions: vo.userInfo.permissions,
        }, {
            expiresIn: this.configService.get('jwt_access_token_expires_time') || '30m',
        });
        vo.refreshToken = this.jwtService.sign({
            userId: vo.userInfo.id,
        }, {
            expiresIn: this.configService.get('jwt_refresh_token_express_time') || '7d',
        });
        return vo;
    }
    async refresh(refreshToken) {
        try {
            const data = this.jwtService.verify(refreshToken);
            const user = await this.userService.findUserById(data.userId, false);
            const access_token = this.jwtService.sign({
                userId: user.id,
                username: user.username,
                roles: user.roles,
                permissions: user.permissions,
            }, {
                expiresIn: this.configService.get('jwt_access_token_expires_time') || '30m',
            });
            const refresh_token = this.jwtService.sign({
                userId: user.id,
            }, {
                expiresIn: this.configService.get('jwt_refresh_token_express_time') || '7d',
            });
            return {
                access_token,
                refresh_token,
            };
        }
        catch (e) {
            throw new common_1.UnauthorizedException('token 已失效，请重新登录');
        }
    }
    async adminRefresh(refreshToken) {
        try {
            const data = this.jwtService.verify(refreshToken);
            const user = await this.userService.findUserById(data.userId, true);
            const access_token = this.jwtService.sign({
                userId: user.id,
                username: user.username,
                roles: user.roles,
                permissions: user.permissions,
            }, {
                expiresIn: this.configService.get('jwt_access_token_expires_time') || '30m',
            });
            const refresh_token = this.jwtService.sign({
                userId: user.id,
            }, {
                expiresIn: this.configService.get('jwt_refresh_token_express_time') || '7d',
            });
            return {
                access_token,
                refresh_token,
            };
        }
        catch (e) {
            throw new common_1.UnauthorizedException('token 已失效，请重新登录');
        }
    }
    async info(userId) {
        const user = await this.userService.findUserDetailById(userId);
        const vo = new user_info_vo_1.UserDetailVo();
        vo.id = user.id;
        vo.email = user.email;
        vo.username = user.username;
        vo.headPic = user.headPic;
        vo.phoneNumber = user.phoneNumber;
        vo.nickName = user.nickName;
        vo.createTime = user.createTime;
        vo.isFrozen = user.isFrozen;
        return vo;
    }
    async updatePassword(userId, passwordDto) {
        return await this.userService.updatePassword(userId, passwordDto);
    }
    async updatePasswordCaptcha(address) {
        const code = Math.random().toString().slice(2, 8);
        await this.redisService.set(`update_password_captcha_${address}`, code, 10 * 60);
        await this.emailService.sendMail({
            to: address,
            subject: '更改密码验证码',
            html: `<p>你的更改密码验证码是 ${code}</p>`,
        });
        return '发送成功';
    }
    async update(userId, updateUserDto) {
        return await this.userService.update(userId, updateUserDto);
    }
    async updateCaptcha(address) {
        const code = Math.random().toString().slice(2, 8);
        await this.redisService.set(`update_user_captcha_${address}`, code, 10 * 60);
        await this.emailService.sendMail({
            to: address,
            subject: '更改用户信息验证码',
            html: `<p>你的验证码是 ${code}</p>`,
        });
        return '发送成功';
    }
    async freeze(userId) {
        await this.userService.freezeUserById(userId);
        return 'success';
    }
    async list(pageNo, pageSize, username, nickName, email) {
        return await this.userService.findUsers(username, nickName, email, pageNo, pageSize);
    }
};
__decorate([
    (0, common_1.Inject)(jwt_1.JwtService),
    __metadata("design:type", jwt_1.JwtService)
], UserController.prototype, "jwtService", void 0);
__decorate([
    (0, common_1.Inject)(config_1.ConfigService),
    __metadata("design:type", config_1.ConfigService)
], UserController.prototype, "configService", void 0);
__decorate([
    (0, common_1.Inject)(redis_service_1.RedisService),
    __metadata("design:type", redis_service_1.RedisService)
], UserController.prototype, "redisService", void 0);
__decorate([
    (0, common_1.Inject)(email_service_1.EmailService),
    __metadata("design:type", email_service_1.EmailService)
], UserController.prototype, "emailService", void 0);
__decorate([
    (0, common_1.Get)('initData'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserController.prototype, "initData", null);
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [registerUser_dto_1.RegisterUserDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [loginUser_dto_1.LoginUserDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "userLogin", null);
__decorate([
    (0, common_1.Post)('admin/login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [loginUser_dto_1.LoginUserDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "adminLogin", null);
__decorate([
    (0, common_1.Get)('refresh'),
    __param(0, (0, common_1.Query)('refreshToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "refresh", null);
__decorate([
    (0, common_1.Get)('admin/refresh'),
    __param(0, (0, common_1.Query)('refreshToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "adminRefresh", null);
__decorate([
    (0, common_1.Get)('info'),
    (0, custom_decorator_1.RequireLogin)(),
    __param(0, (0, custom_decorator_1.UserInfo)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "info", null);
__decorate([
    (0, common_1.Post)(['updatePassword', 'admin/updatePassword']),
    (0, custom_decorator_1.RequireLogin)(),
    __param(0, (0, custom_decorator_1.UserInfo)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_user_password_dto_1.UpdateUserPasswordDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updatePassword", null);
__decorate([
    (0, common_1.Get)('updatePassword/captcha'),
    __param(0, (0, common_1.Query)('address')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updatePasswordCaptcha", null);
__decorate([
    (0, common_1.Post)(['update', 'admin/update']),
    (0, custom_decorator_1.RequireLogin)(),
    __param(0, (0, custom_decorator_1.UserInfo)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "update", null);
__decorate([
    (0, common_1.Get)('update/captcha'),
    __param(0, (0, common_1.Query)('address')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateCaptcha", null);
__decorate([
    (0, common_1.Get)('freeze'),
    __param(0, (0, common_1.Query)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "freeze", null);
__decorate([
    (0, common_1.Get)('list'),
    __param(0, (0, common_1.Query)('pageNo', new common_1.DefaultValuePipe(0), (0, parseInt_1.generateParseIntPipe)('pageNo'))),
    __param(1, (0, common_1.Query)('pageSize', new common_1.DefaultValuePipe(0), (0, parseInt_1.generateParseIntPipe)('pageSize'))),
    __param(2, (0, common_1.Query)('username')),
    __param(3, (0, common_1.Query)('nickName')),
    __param(4, (0, common_1.Query)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, String, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "list", null);
UserController = __decorate([
    (0, common_1.Controller)('user'),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UserController);
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map