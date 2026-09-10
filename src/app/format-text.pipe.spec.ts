import { FormatTextPipe } from './format-text.pipe';
import { DomSanitizer } from '@angular/platform-browser';

describe('FormatTextPipe', () => {
  it('create an instance', () => {
    const pipe = new FormatTextPipe({} as DomSanitizer);
    expect(pipe).toBeTruthy();
  });
});
