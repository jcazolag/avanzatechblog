def can_edit_blog(user, blog):
    return (
        user.is_authenticated and (
            (blog.author == user and blog.author_access == 'Read & Write') or
            (blog.team_access == 'Read & Write' and user.team == blog.author.team) or
            (blog.authenticated_access == 'Read & Write')
        )
    )

def can_view_blog(user, blog):
    return (
        blog.public_access in ['Read Only'] or (
            user.is_authenticated and (
                (blog.authenticated_access in ['Read Only', 'Read & Write']) or
                (blog.author == user and blog.author_access in ['Read Only', 'Read & Write']) or
                (hasattr(user, 'team') and blog.team_access in ['Read Only', 'Read & Write'] and blog.author.team == user.team)
            )
        )
    )

def can_interact_blog(user, blog):
        """Verifica si el usuario tiene permisos para comentar al blog."""
        return (
            user.is_authenticated and (
                (blog.authenticated_access in ['Read Only', 'Read & Write']) or
                (user == blog.author and blog.author_access in ['Read Only', 'Read & Write']) or
                (hasattr(user, 'team') and blog.team_access in ['Read Only', 'Read & Write'] and blog.author.team == user.team)
            )
        )