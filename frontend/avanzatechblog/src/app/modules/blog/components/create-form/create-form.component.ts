import { Component, WritableSignal, inject, signal } from '@angular/core';
import { NewPost } from '@models/Post.model';
import { UserService } from '@services/user.service';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PostsService } from '@services/posts.service';
import { CommonModule } from '@angular/common';
import { BlogService } from '@services/blog.service';

@Component({
  selector: 'app-create-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './create-form.component.html',
  styleUrl: './create-form.component.css'
})
export class CreateFormComponent {
  form: FormGroup;
  user = inject(UserService).user;
  message = signal<string>('');

  constructor(
    private formBuilder: FormBuilder,
    private postService: PostsService,
    private router: Router,
    private blogService: BlogService
  ) {
    this.form = this.formBuilder.group(
      {
        title: ['', [Validators.required, Validators.maxLength(50)]],
        content: ['', [Validators.required]],
        author_access: ['Read & Write', [Validators.required]],
        team_access: ['Read Only', [Validators.required]],
        authenticated_access: ['Read Only', Validators.required],
        public_access: ['Read Only', [Validators.required]]
      }
    );

    this.form.get('author_access')?.valueChanges.subscribe(value => {
      if (value === 'Read Only') {
        // Si Author solo puede leer, los demás no pueden escribir
        const restrictedOptions = ['Read & Write'];
        ['team_access', 'authenticated_access', 'public_access'].forEach(field => {
          if (restrictedOptions.includes(this.form.get(field)?.value)) {
            this.form.get(field)?.setValue('Read Only');
          }
        });
      }
    });

    this.form.get('team_access')?.valueChanges.subscribe(value => {
      if (value === 'None') {
        // Si el equipo no tiene acceso, los demás niveles tampoco
        ['authenticated_access', 'public_access'].forEach(field => {
          this.form.get(field)?.setValue('None');
        });
      }
    });

    this.form.get('authenticated_access')?.valueChanges.subscribe(value => {
      if (value === 'None') {
        this.form.get('public_access')?.setValue('None');
      }
    });
  }

  createPost() {
    if (this.form.valid) {
      const {
        title,
        content,
        author_access,
        team_access,
        authenticated_access,
        public_access
      } = this.form.getRawValue();
      const newPost: NewPost = {
        'title': title,
        'content': content,
        'author_access': author_access,
        'team_access': team_access,
        'authenticated_access': authenticated_access,
        'public_access': public_access
      }
      this.postService.createPost(newPost)
        .subscribe({
          next: (response) => {
            this.router.navigate(['/post-detail', response.post?.id]);
          },
          error: (err) => {
            this.message.set(err.message)
          }
        });
    } else {
      console.log(this.form.get('author_access'))
    }
  }

  getAuthorAccessOptions(): string[] {
    return ['Read & Write', 'Read Only'];
  }

  getTeamAccessOptions(): string[] {
    if (this.form.get('author_access')?.value === 'Read Only') {
      return ['Read Only', 'None'];
    }
    return ['Read & Write', 'Read Only', 'None'];
  }

  getAuthenticatedAccessOptions(): string[] {
    if(this.form.get('team_access')?.value === 'None'){
      return ['None'];
    }

    if(this.form.get('team_access')?.value === 'Read Only'){
      return ['Read Only', 'None'];
    }

    return ['Read & Write', 'Read Only', 'None'];
  }

  getPublicAccessOptions(): string[] {
    const authenticatedAccess = this.form.get('authenticated_access')?.value;

    if ( authenticatedAccess === 'None' ) {
      return ['None'];
    }

    return ['Read Only', 'None'];
  }
}
