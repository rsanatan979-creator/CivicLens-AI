from fastapi import APIRouter, HTTPException
from models.prediction import PredictionRequest, PredictionResponse
from services.gemini import GeminiService

router = APIRouter()

@router.post("/predict", response_model=PredictionResponse)
async def predict_civic_issue(payload: PredictionRequest):
    if not payload.imageUrl:
        raise HTTPException(status_code=400, detail="imageUrl is required")
        
    analysis = GeminiService.analyze_image(payload.imageUrl)
    return PredictionResponse(
        category=analysis.get("category", "Road Damage"),
        severity=analysis.get("severity", "MEDIUM"),
        assignedDept=analysis.get("assignedDept", "Roads"),
        confidence=float(analysis.get("confidence", 0.9)),
        description=analysis.get("description", "Infrastructure report analyzed")
    )
