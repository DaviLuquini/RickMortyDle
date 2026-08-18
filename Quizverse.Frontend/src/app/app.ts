import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TitleMetaService } from './services/title-meta.service';
import { FloatingBanner } from './components/floating-banner/floating-banner';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FloatingBanner],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('rickandmortydle');
  constructor(private readonly titleMeta: TitleMetaService) { }
}
