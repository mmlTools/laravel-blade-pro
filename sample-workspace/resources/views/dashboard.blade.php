@extends('layout')
@section('content')
@if($user)<h1>{{$user->name}}</h1>@endif
@endsection
