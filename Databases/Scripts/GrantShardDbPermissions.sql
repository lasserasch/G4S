:SETVAR CollectionDbUserName collection_user

EXEC [xdb_collection].[GrantLeastPrivilege] @UserName = '$(CollectionDbUserName)'
