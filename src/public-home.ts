import { SaveRepository } from './storage/repository';

const updateResumeLinks = async (): Promise<void> => {
  const repository = await SaveRepository.open();
  try {
    const save = await repository.load();
    if (save.revision === 0) return;
    for (const link of document.querySelectorAll<HTMLAnchorElement>('[data-resume-link]')) {
      link.textContent = 'Continue';
      link.setAttribute('aria-label', `Continue at level ${save.currentLevelId}`);
    }
  } finally {
    repository.close();
  }
};

void updateResumeLinks().catch(() => undefined);
