import { Injectable } from '@nestjs/common';
import { CreateEnquiryDto } from './dto/create-enquiry.dto';
import { UpdateEnquiryDto } from './dto/update-enquiry.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EnquiriesService {
  constructor(private prisma: PrismaService) { }

  create(createEnquiryDto: CreateEnquiryDto) {
    return this.prisma.enquiry.create({
      data: createEnquiryDto,
    });
  }

  findAll() {
    return this.prisma.enquiry.findMany();
  }

  findOne(id: number) {
    return this.prisma.enquiry.findUnique({ where: { id } });
  }

  update(id: number, updateEnquiryDto: UpdateEnquiryDto) {
    return this.prisma.enquiry.update({
      where: { id },
      data: updateEnquiryDto,
    });
  }

  remove(id: number) {
    return this.prisma.enquiry.delete({ where: { id } });
  }
}
