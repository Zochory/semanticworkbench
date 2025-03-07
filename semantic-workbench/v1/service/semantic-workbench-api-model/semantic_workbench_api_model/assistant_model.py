from typing import Any

from pydantic import BaseModel


class AssistantPutRequestModel(BaseModel):
    assistant_name: str


class AssistantResponseModel(BaseModel):
    id: str


class StateDescriptionResponseModel(BaseModel):
    id: str
    display_name: str
    description: str


class StateDescriptionListResponseModel(BaseModel):
    states: list[StateDescriptionResponseModel]


class StateResponseModel(BaseModel):
    id: str
    data: dict[str, Any]
    json_schema: dict[str, Any] | None
    ui_schema: dict[str, Any] | None


class StatePutRequestModel(BaseModel):
    data: dict[str, Any]


class ConfigResponseModel(BaseModel):
    config: dict[str, Any]
    json_schema: dict[str, Any] | None
    ui_schema: dict[str, Any] | None


class ConfigPutRequestModel(BaseModel):
    config: dict[str, Any]


class ServiceInfoModel(BaseModel):
    assistant_service_id: str
    name: str
    description: str
    default_config: ConfigResponseModel


class ConversationPutRequestModel(BaseModel):
    id: str


class ConversationResponseModel(BaseModel):
    id: str


class ConversationListResponseModel(BaseModel):
    conversations: list[ConversationResponseModel]
