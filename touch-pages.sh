#!/bin/bash
# Touch all blog pages to trigger AEM content reprocessing
# This forces AEM to process @reference fields and generate image tags
# Run this AFTER installing the pages package
#
# Usage: ./touch-pages.sh <author-url> <auth-token>
# Example: ./touch-pages.sh https://author-p184787-e1941710.adobeaemcloud.com "Bearer eyJ..."

AUTHOR_URL="${1:-https://author-p184787-e1941575.adobeaemcloud.com}"
AUTH="${2}"

if [ -z "$AUTH" ]; then
    echo "Usage: $0 <author-url> <auth-token>"
    echo "Example: $0 https://author-p184787-e1941710.adobeaemcloud.com 'Bearer eyJ...'"
    exit 1
fi

# Read all page paths from the package filter
PAGES=$(grep -oP 'root="/content/mobility-global/en-us/automotive-insights/blogs/[^"]+' /workspace/blog-migration/pkg/META-INF/vault/filter.xml | sed 's/root="//')

TOTAL=$(echo "$PAGES" | wc -l)
echo "Touching $TOTAL blog pages to trigger content reprocessing..."

COUNT=0
ERRORS=0

for PAGE_PATH in $PAGES; do
    COUNT=$((COUNT + 1))

    # Touch the page by posting to its jcr:content node
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
        -X POST \
        -H "Authorization: $AUTH" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "jcr:lastModifiedBy=migration-agent" \
        "${AUTHOR_URL}${PAGE_PATH}/jcr:content")

    if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "201" ]; then
        # Also replicate/publish the page
        curl -s -o /dev/null \
            -X POST \
            -H "Authorization: $AUTH" \
            -d "path=${PAGE_PATH}" \
            -d "cmd=Activate" \
            "${AUTHOR_URL}/bin/replicate.json"
    else
        echo "  ERROR ($RESPONSE): $PAGE_PATH"
        ERRORS=$((ERRORS + 1))
    fi

    if [ $((COUNT % 50)) -eq 0 ]; then
        echo "  Progress: $COUNT/$TOTAL (errors: $ERRORS)"
    fi
done

echo "Done: $COUNT pages touched, $ERRORS errors"
