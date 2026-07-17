from sqlalchemy import Column
from sqlalchemy import DateTime
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Text

from app.database.db import Base


class Document(Base):

    __tablename__ = "Document_Registry"

    document_id = Column(String, primary_key=True, index=True)  # UUID4 string

    filename = Column(String, nullable=False)

    category = Column(String, nullable=False)

    status = Column(String, nullable=False, default="pending")

    upload_timestamp = Column(DateTime, nullable=False)

    uploader_identity = Column(String, nullable=True)

    file_size_bytes = Column(Integer, nullable=False)

    page_count = Column(Integer, nullable=True)

    char_count = Column(Integer, nullable=True)

    chunk_count = Column(Integer, nullable=True)

    error_message = Column(Text, nullable=True)

    file_path = Column(String, nullable=False)
