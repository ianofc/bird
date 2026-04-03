from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='SavedPost',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('post', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='saved_by', to='core.bird')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='saved_posts', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddConstraint(
            model_name='connection',
            constraint=models.UniqueConstraint(fields=('follower', 'target'), name='unique_connection_pair'),
        ),
        migrations.AddConstraint(
            model_name='connection',
            constraint=models.CheckConstraint(condition=models.Q(('follower', models.F('target')), _negated=True), name='prevent_self_connection'),
        ),
        migrations.AddIndex(
            model_name='connection',
            index=models.Index(fields=['target', 'status'], name='core_connec_target__d69c49_idx'),
        ),
        migrations.AddIndex(
            model_name='connection',
            index=models.Index(fields=['follower', 'status'], name='core_connec_followe_e0d75d_idx'),
        ),
        migrations.AddConstraint(
            model_name='savedpost',
            constraint=models.UniqueConstraint(fields=('user', 'post'), name='unique_saved_post_per_user'),
        ),
        migrations.AddIndex(
            model_name='savedpost',
            index=models.Index(fields=['user', '-created_at'], name='core_savedp_user_id_29f4f7_idx'),
        ),
    ]
