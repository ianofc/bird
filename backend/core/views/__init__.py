# Este arquivo permite que o python trate a pasta views como um pacote
# e permite importações como: from core.views import feed, settings

from . import auth, chat, discovery, events, feed, general, groups, interactions, network, posts, profile, settings

__all__ = [
    "auth",
    "feed",
    "posts",
    "profile",
    "settings",
    "interactions",
    "discovery",
    "network",
    "chat",
    "groups",
    "events",
    "general",
]
