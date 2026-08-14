# Import all models here so that Base.metadata is aware of every table before
# create_all() runs. The imports look unused but are load-bearing: importing a
# model registers its table on the shared Base metadata. __all__ documents that
# and marks them as the module's public re-exports.
from app.db.base_class import Base
from app.models.user import User
from app.models.watchlist import WatchlistItem
from app.models.holding import Holding

__all__ = ["Base", "User", "WatchlistItem", "Holding"]
