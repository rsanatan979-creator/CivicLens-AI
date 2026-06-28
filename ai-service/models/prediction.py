from pydantic import BaseModel

class PredictionRequest(BaseModel):
    imageUrl: str

class PredictionResponse(BaseModel):
    category: str
    severity: str
    assignedDept: str
    confidence: float
    description: str
