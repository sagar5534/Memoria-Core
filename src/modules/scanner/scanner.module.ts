import { Module } from '@nestjs/common';
import { MediaModule } from '../media/media.module';
import { ScannerService } from './scanner.service';

@Module({
  imports: [MediaModule],
  controllers: [],
  providers: [ScannerService],
})
export class ScannerModule {}
