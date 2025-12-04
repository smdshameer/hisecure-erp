

export class CreateUserDto {
  email: string;
  password?: string;
  name: string;
  role?: string;
  branch?: string;
  gstin?: string;
  state?: string;
}
