import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(private readonly configService: ConfigService) {}

  // Step 1: redirect user to Google consent screen
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // Guard automatically redirects to Google
  }

  // Step 2: Google calls back here after user consents
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleCallback(@Req() req: any, @Res() res: any) {
    const { accessToken, driveAccessToken, user } = req.user;
    const frontendOrigin = this.configService.get<string>('FRONTEND_ORIGIN') ?? 'http://localhost:888';

    // Redirect to frontend with tokens as URL query params
    const params = new URLSearchParams({
      token: accessToken,
      driveToken: driveAccessToken ?? '',
      user: JSON.stringify(user),
    });

    return res.redirect(`${frontendOrigin}/?${params.toString()}`);
  }

  // Validate current JWT session
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: any) {
    return req.user;
  }
}
