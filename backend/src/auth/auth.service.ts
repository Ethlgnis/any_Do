import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async googleLogin(profile: any, accessToken: string, refreshToken: string) {
    const email = profile.emails?.[0]?.value?.toLowerCase();
    const googleId = profile.id;
    const name = profile.displayName;
    const picture = profile.photos?.[0]?.value ?? '';

    // Find or create user in our DB
    let user = await this.userModel.findOne({ googleId }).exec();

    if (!user) {
      // Try to find by email (in case user existed before)
      user = await this.userModel.findOne({ email }).exec();
    }

    if (user) {
      // Update tokens and picture
      user.driveAccessToken = accessToken;
      if (refreshToken) user.driveRefreshToken = refreshToken;
      user.picture = picture;
      user.name = name;
      user.googleId = googleId;
      await user.save();
    } else {
      user = await this.userModel.create({
        googleId,
        email,
        name,
        picture,
        driveAccessToken: accessToken,
        driveRefreshToken: refreshToken ?? '',
        role: 'user',
      });
    }

    return this.buildAuthResponse(user, accessToken);
  }

  private async buildAuthResponse(user: UserDocument, driveAccessToken: string) {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '7d',
    });

    return {
      accessToken: token,
      driveAccessToken,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        picture: user.picture,
        role: user.role,
      },
    };
  }
}
