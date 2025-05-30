import {
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
  WritableSignal,
} from '@angular/core';
import { NewPost, Post } from '@models/Post.model';
import {
  FormBuilder,
  Validators,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RequestStatus } from '@models/request-status.models';
import { FormsModule } from '@angular/forms';
import {
  NgxEditorComponent,
  NgxEditorMenuComponent,
  Editor,
  Toolbar,
} from 'ngx-editor';

@Component({
  selector: 'app-post-form',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    NgxEditorComponent,
    NgxEditorMenuComponent,
  ],
  templateUrl: './post-form.component.html',
  styleUrl: './post-form.component.css',
})
export class PostFormComponent {
  @Input() post!: Post | null;
  @Input() title: string = 'Post';
  @Input() buttonText: string = 'Submit';
  @Input({ required: true }) status: WritableSignal<RequestStatus> =
    signal<RequestStatus>('init');
  form: FormGroup;

  editor: Editor;

  toolbar: Toolbar = [
    ['bold', 'italic', 'underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    ['link'],
    ['undo', 'redo'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
  ];

  @Output() action = new EventEmitter();
  @Output() cancelAction = new EventEmitter();

  constructor(private formBuilder: FormBuilder) {
    this.editor = new Editor();

    this.form = this.formBuilder.group({
      title: ['', [Validators.required, Validators.maxLength(50)]],
      content: ['', [Validators.required]],
      author_access: ['Read & Write', [Validators.required]],
      team_access: ['Read & Write', [Validators.required]],
      authenticated_access: ['Read Only', Validators.required],
      public_access: ['Read Only', [Validators.required]],
    });
  }

  ngOnInit() {
    this.setupAccessDependencies();
  }

  private setupAccessDependencies() {
    this.form.get('author_access')?.valueChanges.subscribe((value) => {
      if (value === 'Read Only') {
        // Si Author solo puede leer, los demás no pueden escribir
        const restrictedOptions = ['Read & Write'];
        ['team_access', 'authenticated_access', 'public_access'].forEach(
          (field) => {
            if (restrictedOptions.includes(this.form.get(field)?.value)) {
              this.form.get(field)?.setValue('Read Only');
            }
          }
        );
      }
    });

    this.form.get('team_access')?.valueChanges.subscribe((value) => {
      if (value === 'None') {
        // Si el equipo no tiene acceso, los demás niveles tampoco
        ['authenticated_access', 'public_access'].forEach((field) => {
          this.form.get(field)?.setValue('None');
        });
      }
    });

    this.form.get('authenticated_access')?.valueChanges.subscribe((value) => {
      if (value === 'None') {
        this.form.get('public_access')?.setValue('None');
      }
    });
  }

  ngAfterViewInit() {
    this.setForm();
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  setForm() {
    const post = this.post;
    if (post) {
      this.form.get('title')?.setValue(post.title);
      this.form.get('content')?.setValue(post.content);
      this.form.get('author_access')?.setValue(post.author_access);
      this.form.get('team_access')?.setValue(post.team_access);
      this.form
        .get('authenticated_access')
        ?.setValue(post.authenticated_access);
      this.form.get('public_access')?.setValue(post.public_access);
    }
  }


  doAction() {
    if (this.form.valid) {
      const {
        title,
        content,
        author_access,
        team_access,
        authenticated_access,
        public_access,
      } = this.form.getRawValue();
      const newPost: NewPost = {
        title: title,
        content: content,
        author_access: author_access,
        team_access: team_access,
        authenticated_access: authenticated_access,
        public_access: public_access,
      };
      this.action.emit(newPost);
    } else {
      this.form.markAllAsTouched();
    }
  }

  cancel() {
    this.cancelAction.emit();
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
    if (this.form.get('team_access')?.value === 'None') {
      return ['None'];
    }

    if (this.form.get('team_access')?.value === 'Read Only') {
      return ['Read Only', 'None'];
    }

    return ['Read & Write', 'Read Only', 'None'];
  }

  getPublicAccessOptions(): string[] {
    const authenticatedAccess = this.form.get('authenticated_access')?.value;

    if (authenticatedAccess === 'None') {
      return ['None'];
    }

    return ['Read Only', 'None'];
  }
}
