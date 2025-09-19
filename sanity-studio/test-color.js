export default async function(client) {
  const doc = await client.fetch(`*[_type == "project" && defined(hoverColor)][0]`);
  if (doc) {
    console.log('hoverColor:', JSON.stringify(doc.hoverColor, null, 2));
    console.log('textHoverColor:', JSON.stringify(doc.textHoverColor, null, 2));
  } else {
    console.log('No project with hoverColor found');
  }
}