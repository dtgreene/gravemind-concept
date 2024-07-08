import { Module, Global } from '@nestjs/common'
import { AuthService } from 'src/auth/auth.service'

@Global()
@Module({
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
