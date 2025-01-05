export default interface Auth {
  email: string;
  verification_code?: string;
  password: string;
  password_confirmation?: string;
}
