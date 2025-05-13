from django.urls import path
from .views import StreamChatTokenView, CreateChatChannelView

urlpatterns = [
    path('token/', StreamChatTokenView.as_view(), name='stream-chat-token'),
    path('channel/', CreateChatChannelView.as_view(), name='create-chat-channel'),
] 