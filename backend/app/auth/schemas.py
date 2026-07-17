from pydantic import BaseModel
from pydantic import EmailStr


class RegisterUser(BaseModel):

    full_name: str

    email: EmailStr

    password: str


class LoginUser(BaseModel):

    email: EmailStr

    password: str