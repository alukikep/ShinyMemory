import { CONTENT_INDEX, buildContentIndex } from '../core/contentIndex';
import { FIXTURE_CONTENT_PACK } from '../core/content-fixture/pack';

// Every unit test runs against the frozen fixture content pack. Production
// content can be replaced or deleted without rewriting engine tests.
Object.assign(CONTENT_INDEX, buildContentIndex(FIXTURE_CONTENT_PACK));
