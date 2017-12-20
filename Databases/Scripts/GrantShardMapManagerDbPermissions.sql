:SETVAR CollectionDbUserName collection_user

GRANT SELECT ON SCHEMA :: __ShardManagement TO [$(CollectionDbUserName)]

GRANT EXECUTE ON SCHEMA :: __ShardManagement TO [$(CollectionDbUserName)]
