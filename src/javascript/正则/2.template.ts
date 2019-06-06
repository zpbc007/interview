export function render(template: string, data: { [key: string]: any }) {
    const reg = /\{\{(\w+)\}\}/

    if (reg.test(template)) {
        const name = reg.exec(template)[1]
        template = template.replace(reg, data[name])
        return render(template, data)
    }

    return template
}
