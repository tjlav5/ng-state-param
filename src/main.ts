import 'zone.js/dist/zone';
import { Component, inject, Injectable, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { bootstrapApplication } from '@angular/platform-browser';
import { map, Observable, of } from 'rxjs';

interface StateParamStoreOptionProps<T> {
  decode: (val: string | undefined) => T | undefined;
  encode: (val: T | undefined) => string | undefined;
}

type Foo<T> = {
  value$: Observable<T | undefined>;
  set: (val: T | undefined) => void;
};

function stateParamStore<T = string>(
  param: string,
  options: StateParamStoreOptionProps<T>
): Type<Foo<T>> {
  @Injectable()
  class Foo {
    readonly value$: Observable<T | undefined> = of(param).pipe(
      map(options.decode)
    );

    set(val: T | undefined) {
      const encoded = options?.encode(val);
      console.log(`setting ${param} to: `, { encoded });
    }
  }

  return Foo;
}

const FOO = stateParamStore('asdf', {
  decode: (val) => Number(val),
  encode: (val) => val?.toString(),
});

const BAR = stateParamStore('asdf', {
  decode: (val) => val === 'true',
  encode: (val) => val?.toString(),
});

const BAZ = stateParamStore('asdf', {
  decode: (val) => (val ? new Date(val) : undefined),
  encode: (val) => (val ? val.getTime().toString() : undefined),
});

@Component({
  selector: 'my-app',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1>Hello from {{name}}!</h1>
    <a target="_blank" href="https://angular.io/start">
      Learn more about Angular 
    </a>
  `,
  providers: [FOO, BAR],
})
export class App {
  name = 'Angular';

  constructor() {
    const foo = inject(FOO);
    foo.value$.subscribe(console.log);
    foo.set(123);

    const bar = inject(BAR);
    bar.value$.subscribe(console.log);
    bar.set(true);
  }
}

bootstrapApplication(App);
