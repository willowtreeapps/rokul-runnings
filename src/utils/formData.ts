import { Action } from '../types/RokulRunnings';
import * as FormData from 'form-data';
import fs = require('fs');

/** Function to create FormData */
export async function populateFormData({
  action,
  channelLocation,
}: {
  action: Action;
  channelLocation?: string;
}): Promise<FormData> {
  return new Promise(resolve => {
    /** Declare variable */
    const formData = new FormData();
    /** Append data for `mysubmit` */
    formData.append('mysubmit', action);
    /** Append data depending on `mysubmit` value */
    if (action === 'Install' || action === 'Replace') {
      const file = fs.createReadStream(channelLocation);
      const fileNameArray = channelLocation.split('/');
      const fileName = fileNameArray[fileNameArray.length - 1];
      formData.append('archive', file, {
        contentType: 'application/zip',
        filename: fileName,
      });
    } else formData.append('archive', '');

    /** Return the FormData */
    resolve(formData);
  });
}
