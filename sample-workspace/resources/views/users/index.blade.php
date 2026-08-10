<x-layout>@forelse($users as $user)<x-card>{{$user->name}}</x-card>@empty<p>No users</p>@endforelse</x-layout>
