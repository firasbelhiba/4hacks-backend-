import { Module } from '@nestjs/common';
import { R2Service } from './r2.service';

@Module({
  exports: [R2Service],
  providers: [R2Service],
})
export class R2Module {}
