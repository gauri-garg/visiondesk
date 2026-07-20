import logging
import re

logger = logging.getLogger(__name__)


class TextCleaner:
    """
    Normalises and deduplicates extracted PDF text.

    The clean() method is idempotent: clean(clean(t)) == clean(t) for all t.
    It never raises; on step failure it logs a warning and skips the step.
    """

    def clean(self, text: str) -> str:
        """Apply all 5 cleaning steps to text. Returns cleaned string."""
        result = text

        # Remove null bytes
        try:
            result = result.replace('\x00', '')
        except Exception as exc:
            logger.warning("TextCleaner step 1 (null bytes) failed: %s", exc)

        # Remove control characters except \n and \t
        try:
            result = re.sub(r'[\x01-\x08\x0b\x0c\x0e-\x1f\x7f]', '', result)
        except Exception as exc:
            logger.warning("TextCleaner step 2 (control chars) failed: %s", exc)

        # Collapse more than 2 consecutive blank lines into 2
        try:
            result = re.sub(r'\n{3,}', '\n\n', result)
        except Exception as exc:
            logger.warning("TextCleaner step 3 (blank lines) failed: %s", exc)

        # Collapse runs of more than 2 consecutive spaces/tabs into one space
        try:
            result = re.sub(r'[ \t]{3,}', ' ', result)
        except Exception as exc:
            logger.warning("TextCleaner step 4 (whitespace) failed: %s", exc)

        # Remove duplicate paragraphs (blank-line delimited)
        try:
            paragraphs = result.split('\n\n')
            seen = []
            unique_paragraphs = []
            for para in paragraphs:
                stripped = para.strip()
                if stripped and stripped in seen:
                    continue  # skip duplicate
                unique_paragraphs.append(para)
                if stripped:
                    seen.append(stripped)
            result = '\n\n'.join(unique_paragraphs)
        except Exception as exc:
            logger.warning("TextCleaner step 5 (dedup paragraphs) failed: %s", exc)

        return result