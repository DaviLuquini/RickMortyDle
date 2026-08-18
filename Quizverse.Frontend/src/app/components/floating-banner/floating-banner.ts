import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExternalLink, Sparkles, X, Globe, ChevronDown, ChevronUp } from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-floating-banner',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './floating-banner.html',
  styleUrl: './floating-banner.scss'
})
export class FloatingBanner {
  public readonly ExternalLink = ExternalLink;
  public readonly Sparkles = Sparkles;
  public readonly X = X;
  public readonly Globe = Globe;
  public readonly ChevronDown = ChevronDown;
  public readonly ChevronUp = ChevronUp;

  public isVisible = signal(true);
  public isMinimized = signal(false);

  public readonly targetUrl =
    'https://dldigitalsa.com.br/?utm_source=rickandmortydle&utm_medium=floating_banner&utm_campaign=portfolio_referral';

  toggleMinimize(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.isMinimized.update((v) => !v);
  }

  close(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.isVisible.set(false);
  }
}
