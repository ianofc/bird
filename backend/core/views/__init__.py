# Este arquivo permite que o python trate a pasta views como um pacote
# e permite importações como: from core.views import feed, settings

from . import (
    auth as auth,
    feed as feed,
    posts as posts,
    profile as profile,
    settings as settings,
    interactions as interactions,
    discovery as discovery,
    network as network,
    chat as chat,
    groups as groups,
    events as events,
    general as general,
)
