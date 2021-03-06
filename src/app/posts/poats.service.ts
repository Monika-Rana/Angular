import { Post } from './post.model';
import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders  } from '@angular/common/http';
import { map } from 'rxjs/operators';
import {Subject} from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class PostsService {
  private posts: Post[] = [];
private postUpdated = new Subject<Post[]>();

constructor(private http: HttpClient , private router: Router){}



  getPosts() {
    this.http
      .get<{ message: string; posts: any }>( "http://localhost:3000/api/posts")
      .pipe(map(postData => {
          return postData.posts.map(post =>{
            return {
              title: post.title,
              content : post.content,
              id: post._id,
              imagePath: post.imagePath
            };
          });
      }))
      .subscribe(transformedPosts => {
        this.posts = transformedPosts;
        this.postUpdated.next([...this.posts]);
      });
  }


  getPostUpdateListener(){
    return this.postUpdated.asObservable();
  }

  getPost(id : string){
    return this.http.get<{_id: string , title: string , content: string}>("http://localhost:3000/api/posts/"+ id);
  }

  addPost(title: string, content: string , image : File) {
    //const post: Post = { id: null, title: title, content: content };
    const postData = new FormData();
    postData.append('title' , title);
    postData.append('content' , content);
    postData.append('image' , image);

    this.http
      .post<{ message: string , post: Post }>("http://localhost:3000/api/posts", postData)
      .subscribe(responseData => {
        const post: Post =
        {id:responseData.post.id,
           title: title,
           content: content,
           imagePath : responseData.post.imagePath
          };

        this.posts.push(post);
        this.postUpdated.next([...this.posts]);
        this.router.navigate(["/"]);
      });
  }

  updatePost(id: string, title: string, content: string) {
    const post: Post = { id: id, title: title, content: content, imagePath : null };
    this.http
      .put("http://localhost:3000/api/posts/" + id, post)
      .subscribe(response => {
        const updatedPosts = [...this.posts];
        const oldPostIndex = updatedPosts.findIndex(p => p.id === post.id);
        updatedPosts[oldPostIndex] = post;
        this.posts = updatedPosts;
        this.postUpdated.next([...this.posts]);
        this.router.navigate(["/"]);


      });
  }



  deletePost(postId: string) {
    this.http.delete("http://localhost:3000/api/posts/" + postId)
      .subscribe(() => {
        const updatedPosts  = this.posts.filter(post => post.id != postId);
        this.posts = updatedPosts;
        this.postUpdated.next([...this.posts]);
      });
  }


}



