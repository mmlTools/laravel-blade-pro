@section('content')
@if($user)
<div>
@foreach($user->posts as $post)
<article>{{$post->title}}</article>
@endforeach
</div>
@else
<p>No user</p>
@endif
@endsection
