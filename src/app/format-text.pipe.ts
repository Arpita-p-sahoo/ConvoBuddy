import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatText'
})
export class FormatTextPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return value;

    // Replace **text** with <b>text</b>
    value = value.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

    // Replace ```code``` with <pre><code>code</code></pre>
    value = value.replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>');

    // Replace single * with bullet points
    value = value.replace(/^\*\s(.*?)(?=\*|$)/gm, '<li>$1</li>');

    // Wrap <li> items with <ul> tags
    value = value.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');

    // Handle new lines after periods and for definitions
    value = value.replace(/([.?!])\s*(?=[A-Z])/g, '$1<br><br>');
    
    // Add new lines before headings and between list items
    value = value.replace(/(###\s|\*|\n)/g, '<br>$1');

    return value;
  }
}
