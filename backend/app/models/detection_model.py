from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Text

from app.database.db import Base


class Detection(Base):

    __tablename__ = "detections"

    id = Column(Integer, primary_key=True, index=True)

    filename = Column(String)

    workers = Column(Integer)

    helmets = Column(Integer)

    vests = Column(Integer)

    gloves = Column(Integer)

    goggles = Column(Integer)

    boots = Column(Integer)

    violations = Column(Integer)

    safety_score = Column(Integer)

    risk = Column(String)

    ai_report = Column(Text)

    pdf_path = Column(String)