import { Fragment } from 'react';
import type { WorkflowStop } from '@/data';

export function renderCopy(stop: WorkflowStop, emClass: string) {
  const { copy, emphasis } = stop;
  if (!emphasis) return copy;
  const at = copy.indexOf(emphasis);
  if (at < 0) return copy;
  return (
    <Fragment>
      {copy.slice(0, at)}
      <em className={emClass}>{emphasis}</em>
      {copy.slice(at + emphasis.length)}
    </Fragment>
  );
}
